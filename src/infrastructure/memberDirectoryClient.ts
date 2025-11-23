import { MemberDirectory } from "../application/broadcastAnnouncement";
import { logInfo } from "./logger";

/**
 * HTTP client for fetching member directory data from external service
 * TODO: Implement actual HTTP calls to member directory service
 */
export class HttpMemberDirectoryClient implements MemberDirectory {
  async *listRecipients(segment: string): AsyncGenerator<{
    email?: string;
    phone?: string;
  }> {
    // TODO: Replace with actual HTTP call to member directory service
    // For now, return mock data for testing
    logInfo(`Fetching members from segment: ${segment}`);

    const mockMembers = [
      { email: "user1@example.com", phone: "+1234567890" },
      { email: "user2@example.com", phone: "+1234567891" },
      { email: "user3@example.com" },
      { phone: "+1234567892" },
    ];

    for (const member of mockMembers) {
      yield member;
    }
  }
}
