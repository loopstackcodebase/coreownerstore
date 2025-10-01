// app/api/user/products/viewProducts/[username]/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { ProductModel } from "@/app/model/products/product.schema";
import { StoreModel } from "@/app/model/store/store.schema";
import mongoose from "mongoose";
import { UserModel } from "@/app/model/users/user.schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; productId: string }> }
) {
  try {
    const { username, productId } = await params;

    if (!username || !productId) {
      return NextResponse.json(
        { error: "Username and Product ID are required", success: false },
        { status: 400 }
      );
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format", success: false },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // OPTIMIZATION 1: Single aggregation pipeline to get all data in one query
    const result = await UserModel.aggregate([
      // Match user by username
      { $match: { username: username } },

      // Lookup store data
      {
        $lookup: {
          from: "stores", // Assuming your stores collection name
          localField: "_id",
          foreignField: "ownerId",
          as: "store",
          pipeline: [
            {
              $project: {
                _id: 1,
                displayName: 1,
                description: 1,
                "contact.whatsAppSupport": 1,
              },
            },
          ],
        },
      },

      // Unwind store (should be single document)
      { $unwind: "$store" },

      // Lookup main product
      {
        $lookup: {
          from: "products", // Assuming your products collection name
          let: { storeId: "$store._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", new mongoose.Types.ObjectId(productId)] },
                    { $eq: ["$storeId", "$$storeId"] },
                    { $eq: ["$softDelete", false] },
                  ],
                },
              },
            },
          ],
          as: "product",
        },
      },

      // Unwind product (should be single document)
      { $unwind: "$product" },

      // Lookup related products (same category, different product)
      {
        $lookup: {
          from: "products",
          let: {
            storeId: "$store._id",
            category: "$product.category",
            currentProductId: "$product._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$storeId", "$$storeId"] },
                    { $eq: ["$category", "$$category"] },
                    { $ne: ["$_id", "$$currentProductId"] },
                    { $eq: ["$softDelete", false] },
                    { $eq: ["$inStock", true] },
                  ],
                },
              },
            },
            { $sort: { totalViews: -1 } },
            { $limit: 4 },
            {
              $project: {
                name: 1,
                images: 1,
                actualPrice: 1,
                offerPrice: 1,
                availableLocation: 1,
              },
            },
          ],
          as: "relatedProducts",
        },
      },

      // Lookup more products from store
      {
        $lookup: {
          from: "products",
          let: {
            storeId: "$store._id",
            currentProductId: "$product._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$storeId", "$$storeId"] },
                    { $ne: ["$_id", "$$currentProductId"] },
                    { $eq: ["$softDelete", false] },
                    { $eq: ["$inStock", true] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 6 },
            {
              $project: {
                name: 1,
                images: 1,
                actualPrice: 1,
                offerPrice: 1,
                category: 1,
                availableLocation: 1,
              },
            },
          ],
          as: "moreFromStore",
        },
      },

      // Project final structure
      {
        $project: {
          username: 1,
          "store._id": 1,
          "store.displayName": 1,
          "store.description": 1,
          "store.contact.whatsAppSupport": 1,
          product: 1,
          relatedProducts: 1,
          moreFromStore: 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Product not found", success: false },
        { status: 404 }
      );
    }

    const data = result[0];
    const product = data.product;

    // OPTIMIZATION 2: Increment views asynchronously (don't wait for it)
    const shouldIncrementViews =
      request.headers.get("increment-views") === "true";
    if (shouldIncrementViews) {
      // Fire and forget - don't await this
      ProductModel.findByIdAndUpdate(productId, {
        $inc: { totalViews: 1 },
      }).catch((err) => console.error("Error incrementing views:", err));

      // Update the response data
      product.totalViews += 1;
    }

    // Calculate discount percentage
    const discountPercentage =
      product.offerPrice && product.actualPrice
        ? Math.round(
            ((product.actualPrice - product.offerPrice) / product.actualPrice) *
              100
          )
        : 0;

    return NextResponse.json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product: {
          _id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          images: product.images,
          actualPrice: product.actualPrice,
          offerPrice: product.offerPrice,
          totalQuantity: product.totalQuantity,
          availableLocation: product.availableLocation,
          inStock: product.inStock,
          keyFeatures: product.keyFeatures,
          totalViews: product.totalViews,
          totalBuys: product.totalBuys,
          createdAt: product.createdAt,
          discountPercentage,
        },
        store: {
          id: data.store._id,
          displayName: data.store.displayName,
          description: data.store.description,
          contactNumber: data.store.contact?.whatsAppSupport,
        },
        user: {
          username: data.username,
        },
        relatedProducts: data.relatedProducts,
        moreFromStore: data.moreFromStore,
        metadata: {
          viewsIncremented: shouldIncrementViews,
          relatedCount: data.relatedProducts.length,
          moreFromStoreCount: data.moreFromStore.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
