import { describe, it, expect } from "vitest";

describe("Item Intake Form Payload Logic", () => {
  function prepareFoundItemPayload(params: {
    name: string;
    category: string;
    description: string;
    locationFound: string;
    dateFound: string;
    photoUrl: string;
    storageLocation: string;
    intakeType: "confiscated" | "found_item" | "lost_item" | "others";
    othersSpecify: string;
  }) {
    const finalLocation =
      params.intakeType === "others"
        ? params.locationFound.trim() || params.othersSpecify.trim() || "N/A - School Inventory"
        : params.locationFound.trim();

    return {
      item_name: params.name.trim(),
      category: params.category,
      description:
        params.description.trim() ||
        (params.intakeType === "others" && params.othersSpecify.trim()
          ? `Specification: ${params.othersSpecify.trim()}`
          : null),
      ai_description: params.description.trim() || null,
      location_found: finalLocation,
      date_found: params.dateFound,
      photo_url: params.photoUrl,
      storage_location: params.storageLocation.trim() || null,
      status: params.intakeType,
      other_specification:
        params.intakeType === "others" ? params.othersSpecify.trim() || null : null,
    };
  }

  it("builds standard found item payload with required location_found", () => {
    const payload = prepareFoundItemPayload({
      name: "Water Bottle",
      category: "Personal Items",
      description: "Blue Hydroflask",
      locationFound: "Library 2nd Floor",
      dateFound: "2026-10-01",
      photoUrl: "https://example.com/photo.jpg",
      storageLocation: "Shelf A-1",
      intakeType: "found_item",
      othersSpecify: "",
    });

    expect(payload.item_name).toBe("Water Bottle");
    expect(payload.location_found).toBe("Library 2nd Floor");
    expect(payload.status).toBe("found_item");
    expect(payload.other_specification).toBeNull();
  });

  it("handles 'others' intake type with custom specification and fallback location", () => {
    const payload = prepareFoundItemPayload({
      name: "Epson Projector",
      category: "School Supplies",
      description: "",
      locationFound: "",
      dateFound: "2026-10-01",
      photoUrl: "https://example.com/projector.jpg",
      storageLocation: "AV Room",
      intakeType: "others",
      othersSpecify: "Classroom 402 Ceiling Mount",
    });

    expect(payload.item_name).toBe("Epson Projector");
    expect(payload.location_found).toBe("Classroom 402 Ceiling Mount");
    expect(payload.status).toBe("others");
    expect(payload.other_specification).toBe("Classroom 402 Ceiling Mount");
    expect(payload.description).toBe("Specification: Classroom 402 Ceiling Mount");
  });

  it("provides safe fallback location when 'others' intake has empty location and empty specify", () => {
    const payload = prepareFoundItemPayload({
      name: "Lab Microscope",
      category: "School Supplies",
      description: "Chemistry lab",
      locationFound: "",
      dateFound: "2026-10-01",
      photoUrl: "https://example.com/microscope.jpg",
      storageLocation: "Science Dept",
      intakeType: "others",
      othersSpecify: "",
    });

    expect(payload.location_found).toBe("N/A - School Inventory");
    expect(payload.status).toBe("others");
    expect(payload.other_specification).toBeNull();
  });
});
