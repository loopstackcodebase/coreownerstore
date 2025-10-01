// app/api/user/products/fetchProducts/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { ProductModel } from "@/app/model/products/product.schema";
import { StoreModel } from "@/app/model/store/store.schema";
import { UserModel } from "@/app/model/users/user.schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required", success: false },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by username
    const user = await UserModel.findOne({ username: username });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // Find store by userId
    const store = await StoreModel.findOne({ ownerId: user._id });
    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this user", success: false },
        { status: 404 }
      );
    }

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    console.log(searchParams, "searchParams");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Validate page and limit
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Page and limit must be positive numbers", success: false },
        { status: 400 }
      );
    }

    // Build base filter object - only products from this store and not soft deleted
    const filter: any = {
      storeId: store._id,
      softDelete: false,
    };

    // Handle search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keyFeatures: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Handle category filtering
    let products;
    const skip = (page - 1) * limit;

    if (!category || category === "all") {
      // Fetch all products - no category filter
      products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("storeId", "displayName description");
    } else {
      // Filter by category field in database
      // Only 3 categories: popular, special, limited
      filter.category = category; // Direct match with category field
      
      products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("storeId", "displayName description");
    }

    // Get total count for pagination info
    let totalProducts;
    if (!category || category === "all") {
      totalProducts = await ProductModel.countDocuments({
        storeId: store._id,
        softDelete: false,
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { keyFeatures: { $in: [new RegExp(search, "i")] } },
              ],
            }
          : {}),
      });
    } else {
      totalProducts = await ProductModel.countDocuments(filter);
    }

    const totalPages = Math.ceil(totalProducts / limit);

    // Get unique categories for filtering
    const categories = await ProductModel.distinct("category", {
      storeId: store._id,
      softDelete: false,
    });

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        store: {
          id: store._id,
          displayName: store.displayName,
          description: store.description,
        },
        user: {
          username: user.username,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
        filters: {
          categories,
          appliedFilters: {
            category,
            search,
          },
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}