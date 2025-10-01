// app/api/user/aboutus/fetchStoreAboutus/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
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

    // Find store by ownerId and select only aboutUs related fields
    const store = await StoreModel.findOne({ ownerId: user._id }).select(
      "displayName description logo aboutUs"
    );

    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this user", success: false },
        { status: 404 }
      );
    }

    // Check if aboutUs data exists
    if (!store.aboutUs) {
      return NextResponse.json(
        { error: "About us information not available for this store", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Store about us information fetched successfully",
      data: {
        store: {
          id: store._id,
          displayName: store.displayName,
          description: store.description,
          logo: store.logo,
        },
        user: {
          username: user.username,
        },
        aboutUs: store.aboutUs,
      },
    });
  } catch (error: any) {
    console.error("Error fetching store about us:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}