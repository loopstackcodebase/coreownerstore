import connectToDatabase from "@/app/lib/dbconfig";
import { StoreModel } from "@/app/model/store/store.schema";
import { UserModel } from "@/app/model/users/user.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userid: string }> }
) {
  try {
    // Get userid from route parameters
    const { userid } = await params;

    if (!userid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by username (userid)
    const user = await UserModel.findOne({ username: userid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find store by ownerId
    const store = await StoreModel.findOne({ ownerId: user._id });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this user" },
        { status: 404 }
      );
    }

    // Return only store name and logo
    return NextResponse.json({
      success: true,
      data: {
        storeName: store.displayName,
        storeLogo: store.logo,
      },
    });
  } catch (error) {
    console.error("Error fetching store details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
