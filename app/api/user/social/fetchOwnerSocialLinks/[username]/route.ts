import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { StoreModel } from "@/app/model/store/store.schema";
import { UserModel } from "@/app/model/users/user.schema";
import { SocialLinksModel } from "@/app/model/social-links/social.schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Validate username parameter
    if (!username) {
      return NextResponse.json(
        { error: "Username is required", success: false },
        { status: 400 }
      );
    }

    // Basic username validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Invalid username format. Only alphanumeric characters and underscores are allowed", success: false },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by username
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "User account is not active", success: false },
        { status: 403 }
      );
    }

    // Find store by ownerId and include logo
    const store = await StoreModel.findOne({ ownerId: user._id }).select(
      "displayName description email logo"
    );

    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this user", success: false },
        { status: 404 }
      );
    }

    // Find social links for this store
    const socialLinksData = await SocialLinksModel.findOne({
      storeId: store._id,
    });

    // Helper function to validate and format URLs
    const formatSocialLinks = (links: any[]) => {
      return links
        .map((link, index) => {
          // Add https:// if no protocol is specified
          let formattedUrl = link.url;
          if (
            formattedUrl &&
            !formattedUrl.startsWith("http://") &&
            !formattedUrl.startsWith("https://")
          ) {
            formattedUrl = "https://" + formattedUrl;
          }

          // Extract domain for display purposes
          let domain = "";
          try {
            const url = new URL(formattedUrl);
            domain = url.hostname.replace("www.", "");
          } catch (error) {
            domain = "Invalid URL";
          }

          // Determine icon and color based on domain or title
          let icon = "Globe";
          let color = "from-gray-400 to-gray-600";

          const lowerTitle = link.title.toLowerCase();
          const lowerDomain = domain.toLowerCase();

          if (lowerDomain.includes("instagram") || lowerTitle.includes("instagram")) {
            icon = "Instagram";
            color = "from-pink-400 to-purple-600";
          } else if (lowerDomain.includes("twitter") || lowerTitle.includes("twitter") || lowerDomain.includes("x.com")) {
            icon = "Twitter";
            color = "from-sky-400 to-blue-500";
          } else if (lowerDomain.includes("youtube") || lowerTitle.includes("youtube")) {
            icon = "Youtube";
            color = "from-red-400 to-red-600";
          } else if (lowerDomain.includes("facebook") || lowerTitle.includes("facebook")) {
            icon = "Facebook";
            color = "from-blue-500 to-blue-700";
          } else if (lowerDomain.includes("linkedin") || lowerTitle.includes("linkedin")) {
            icon = "Linkedin";
            color = "from-blue-600 to-blue-800";
          } else if (lowerTitle.includes("mail") || formattedUrl.startsWith("mailto:")) {
            icon = "Mail";
            color = "from-green-400 to-emerald-600";
          } else if (lowerTitle.includes("support") || lowerTitle.includes("donate") || lowerTitle.includes("coffee")) {
            icon = "Heart";
            color = "from-orange-400 to-red-500";
          }

          return {
            id: index + 1,
            title: link.title.trim(),
            url: formattedUrl,
            domain: domain,
            originalUrl: link.url,
            icon: icon,
            color: color,
          };
        })
        .filter((link) => link.title && link.url); // Filter out empty links
    };

    // Format social links if they exist
    const formattedSocialLinks = socialLinksData?.socialLinks 
      ? formatSocialLinks(socialLinksData.socialLinks)
      : [];

    // Return structured response
    return NextResponse.json({
      success: true,
      message: "Social links fetched successfully",
      data: {
        store: {
          id: store._id,
          displayName: store.displayName,
          description: store.description,
          email: store.email,
          logo: store.logo, // Include store logo as requested
        },
        user: {
          id: user._id,
          username: user.username,
        },
        socialLinks: formattedSocialLinks,
      },
    });

  } catch (error: any) {
    console.error("Error fetching social links by username:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid data format", success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
