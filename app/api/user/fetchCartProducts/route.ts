import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { ProductModel } from "@/app/model/products/product.schema";
import { StoreModel } from "@/app/model/store/store.schema";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { productIds } = body;

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product IDs array is required",
        },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const validObjectIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validObjectIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid product IDs provided",
        },
        { status: 400 }
      );
    }

    // Fetch products with minimal details needed for cart
    const products = await ProductModel.find({
      _id: { $in: validObjectIds },
      softDelete: false,
      inStock: true
    })
    .select('name images actualPrice offerPrice totalQuantity availableLocation category storeId')
    .populate({
      path: 'storeId',
      select: 'displayName contactNumber',
      model: StoreModel
    })
    .lean();

    // Transform data for cart display
    const cartProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || '/api/placeholder/150/150',
      actualPrice: product.actualPrice,
      offerPrice: product.offerPrice || product.actualPrice,
      totalQuantity: product.totalQuantity,
      availableLocation: product.availableLocation,
      category: product.category,
      store: {
        id: product.storeId._id,
        displayName: product.storeId.displayName,
        contactNumber: product.storeId.contactNumber
      },
      discountPercentage: product.offerPrice && product.offerPrice < product.actualPrice 
        ? Math.round(((product.actualPrice - product.offerPrice) / product.actualPrice) * 100)
        : 0
    }));

    return NextResponse.json({
      success: true,
      message: "Cart products fetched successfully",
      data: {
        products: cartProducts,
        totalProducts: cartProducts.length
      }
    });

  } catch (error) {
    console.error("Error fetching cart products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}