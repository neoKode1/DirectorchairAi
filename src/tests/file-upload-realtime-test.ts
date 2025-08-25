import { fal, QueueStatus, RequestLog } from "@fal-ai/client";

interface FileUploadResponse {
  file_url: string;
  status: string;
}

async function testFileUploadRealtime() {
  try {
    console.log("Starting File Upload Realtime test...");

    // Create a sample file for testing
    const file = new File(["test content"], "test.txt", { type: "text/plain" });

    // Upload the file
    const fileUrl = await fal.storage.upload(file);
    console.log("File uploaded:", fileUrl);

    // Test realtime connection
    const result = await fal.subscribe("fal-ai/file-upload-realtime", {
      input: {
        file_url: fileUrl,
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log: RequestLog) => log.message).forEach(console.log);
        }
      },
    });

    console.log("File Upload Realtime test completed!");
    console.log("Result:", result);
    const response = result.data as FileUploadResponse;
    console.log("File URL:", response.file_url);
    console.log("Status:", response.status);
  } catch (error) {
    console.error("Error in File Upload Realtime test:", error);
  }
}

// Run the test
testFileUploadRealtime(); 