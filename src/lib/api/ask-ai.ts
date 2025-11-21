import {
  ChatMetadata,
  Message,
  NewMessageResponse,
  ChatDocumentsResponse,
} from "@/lib/types/ask-ai";
import { API_BASE_URL } from "@/lib/config/api";

export async function getChats(): Promise<ChatMetadata[]> {
  const response = await fetch(`${API_BASE_URL}/askai/chats`);
  if (!response.ok) throw new Error("Failed to fetch chats");
  return response.json();
}

export async function createChat(driveUrl?: string | null, tenderId?: string | null): Promise<ChatMetadata> {
  const response = await fetch(`${API_BASE_URL}/askai/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driveUrl, tenderId }),
  });
  if (!response.ok) throw new Error("Failed to create chat");
  return response.json();
}

export async function getChat(chatId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}`);
  if (!response.ok) throw new Error("Failed to fetch chat messages");
  return response.json();
}

export async function deleteChat(chatId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete chat");
}

export async function renameChat(chatId: string, title: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Failed to rename chat");
}

export async function sendMessage(
  chatId: string,
  message: string
): Promise<NewMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

export async function uploadPdf(chatId: string, file: File): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("pdf", file);
  
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/upload-pdf`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload PDF");
  return response.json();
}

export async function addDriveFolder(chatId: string, driveUrl: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/add-drive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driveUrl }),
  });
  if (!response.ok) throw new Error("Failed to add drive folder");
  return response.json();
}

export async function getChatDocuments(chatId: string): Promise<ChatDocumentsResponse> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/docs`);
  if (!response.ok) throw new Error("Failed to fetch chat documents");
  return response.json();
}

export async function deletePdf(chatId: string, pdfName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/askai/chats/${chatId}/pdfs/${pdfName}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete PDF");
}

export function uploadFileWithProgress(
  chatId: string,
  file: File,
  onProgress: (progress: number) => void
): { promise: Promise<void>; xhr: XMLHttpRequest } {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append("pdf", file);

  const promise = new Promise<void>((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload canceled."));
    });

    xhr.open("POST", `${API_BASE_URL}/askai/chats/${chatId}/upload-pdf`);
    xhr.send(formData);
  });

  return { promise, xhr };
}

export function subscribeToChatDocuments(
  chatId: string,
  onUpdate: (data: ChatDocumentsResponse) => void,
  onError?: (error: Error) => void
): EventSource {
  const eventSource = new EventSource(`${API_BASE_URL}/askai/chats/${chatId}/docs-sse`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ChatDocumentsResponse;
      onUpdate(data);
    } catch (error) {
      if (onError) onError(new Error("Failed to parse SSE data"));
    }
  };

  eventSource.onerror = (error) => {
    if (onError) onError(new Error("SSE connection error"));
    eventSource.close();
  };

  return eventSource;
}
