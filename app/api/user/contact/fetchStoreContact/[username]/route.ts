// app/api/user/store/fetchStoreContact/[username]/route.ts
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

    // Find store by ownerId and select contact related fields
    const store = await StoreModel.findOne({ ownerId: user._id }).select(
      "displayName description email logo contact businessHours quickHelp"
    );

    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this user", success: false },
        { status: 404 }
      );
    }

    // Helper function to get current store status
    const getCurrentStoreStatus = () => {
      const now = new Date();
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const todayHours = store.businessHours.find(
        (hour: any) => hour.day === currentDay
      );

      if (!todayHours || !todayHours.isOpen) {
        return {
          isOpen: false,
          status: "Closed",
          message: "Store is closed today",
        };
      }

      if (
        currentTime >= todayHours.openTime &&
        currentTime <= todayHours.closeTime
      ) {
        return {
          isOpen: true,
          status: "Open",
          message: `Open until ${todayHours.closeTime}`,
          closingTime: todayHours.closeTime,
        };
      } else if (currentTime < todayHours.openTime) {
        return {
          isOpen: false,
          status: "Opening Soon",
          message: `Opens at ${todayHours.openTime}`,
          openingTime: todayHours.openTime,
        };
      } else {
        return {
          isOpen: false,
          status: "Closed",
          message: "Store is closed for today",
        };
      }
    };

    // Get next opening hours for closed stores
    const getNextOpeningHours = () => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = new Date().getDay();

      for (let i = 1; i <= 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = days[dayIndex];
        const dayHours = store.businessHours.find(
          (hour: any) => hour.day === dayName
        );

        if (dayHours && dayHours.isOpen) {
          return {
            day: dayName,
            openTime: dayHours.openTime,
            closeTime: dayHours.closeTime,
          };
        }
      }
      return null;
    };

    const currentStatus = getCurrentStoreStatus();
    const nextOpeningHours = !currentStatus.isOpen
      ? getNextOpeningHours()
      : null;

    return NextResponse.json({
      success: true,
      message: "Store contact information fetched successfully",
      data: {
        store: {
          id: store._id,
          displayName: store.displayName,
          description: store.description,
          email: store.email,
          logo: store.logo,
        },
        user: {
          username: user.username,
        },
        contact: store.contact,
        businessHours: store.businessHours,
        quickHelp: store.quickHelp,
        storeStatus: {
          current: currentStatus,
          nextOpening: nextOpeningHours,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching store contact:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}