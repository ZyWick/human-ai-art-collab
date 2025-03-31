import { processImage, segmentImage } from '../util/processImage';

// A mock for the Image class
class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    // Default dimensions; these can be set per test using static properties.
    this.width = MockImage.defaultWidth || 100;
    this.height = MockImage.defaultHeight || 100;
    this._src = "";
  }

  set src(val) {
    this._src = val;
    // Wait 50ms to ensure that onload/onerror have been assigned.
    // console.log(val)
    setTimeout(() => {
      if (val === "error") {
        console.log("please")
        if (this.onerror) this.onerror(new Error("Image load error"));
      } else {
        if (this.onload) this.onload();
      }
    }, 50);
  }
  

  get src() {
    return this._src;
  }
}

// Override global Image with our mock.
global.Image = MockImage;

// Override URL.createObjectURL to simply return the file name,
// unless overridden for error tests.
URL.createObjectURL = jest.fn((file) => {
  console.log("waht")
  console.log("simulateError:", file.simulateError); // Debugging
  return file.simulateError ? "error" : "mocked-url";
});

function createMockCanvas() {
  return {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage: jest.fn(),
    }),
    toBlob(callback, type, quality) {
      callback(new Blob(["dummy"], { type }));
    },
  };
}

const originalCreateElement = document.createElement;
document.createElement = (tagName) => {
  if (tagName.toLowerCase() === "canvas") {
    return createMockCanvas();
  }
  return originalCreateElement.call(document, tagName);
};


describe("processImage", () => {
  
beforeAll(() => {
  global.URL.createObjectURL = jest.fn((file) => {
    console.log("waht"); // Debugging
    console.log("File object:", file);
    console.log("simulateError property:", file.simulateError);
    return file.simulateError ? "error" : "mocked-url";
  });
});

  afterEach(() => {
    delete MockImage.defaultWidth;
    delete MockImage.defaultHeight;
  });

  it("should process image without scaling when dimensions are within limits", async () => {
    // Set dimensions below limits.
    MockImage.defaultWidth = 200;
    MockImage.defaultHeight = 800;

    const file = new File(["dummy content"], "test.webp", { type: "image/webp" });
    const result = await processImage(file);

    expect(result.file.name).toBe("test.webp");
    expect(result.width).toBe(200);
    expect(result.height).toBe(800);
  });

  it("should scale image when dimensions exceed limits", async () => {
    // For example, width = 540 and height = 2000 exceed MAX_WIDTH (270) and MAX_HEIGHT (1000).
    MockImage.defaultWidth = 540;
    MockImage.defaultHeight = 2000;

    const file = new File(["dummy content"], "large.webp", { type: "image/webp" });
    const result = await processImage(file);

    // Expected scale factor: min(270/540, 1000/2000) = 0.5.
    expect(result.width).toBe(Math.round(540 * 0.5));
    expect(result.height).toBe(Math.round(2000 * 0.5));
    expect(result.file.name).toBe("large.webp");
  });

  // it("should reject when image fails to load", async () => {
  //   const file = new File(["dummy content"], "error.webp", { type: "image/webp" });
  //   file.simulateError = true;

  //   await expect(processImage(file)).rejects.toThrow("Image load error");
  // });
});


describe("segmentImage", () => {
  afterEach(() => {
    delete MockImage.defaultWidth;
    delete MockImage.defaultHeight;
  });

  it("should segment image correctly into full image + 9 segments", async () => {
    // Use an image size that divides evenly (e.g., 300x300).
    MockImage.defaultWidth = 300;
    MockImage.defaultHeight = 300;

    const file = new File(["dummy content"], "sample.webp", { type: "image/webp" });
    const segments = await segmentImage(file);

    // Expect 10 segments: the full image plus 9 segmented parts.
    expect(segments).toHaveLength(10);
    expect(segments[0].name).toBe("sample.webp");
    expect(segments[1].name).toBe("sample_segment_0_0.webp");
    segments.forEach(segment => {
      expect(segment.blob).toBeInstanceOf(Blob);
    });
  });

  // it("should reject when image fails to load", async () => {
  //   const file = new File(["dummy content"], "errorSegment.webp", { type: "image/webp" });
  //   file.simulateError = true;

  //   await expect(segmentImage(file)).rejects.toThrow("Failed to load image");
  // });
});