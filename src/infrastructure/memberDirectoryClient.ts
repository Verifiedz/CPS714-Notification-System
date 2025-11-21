import { config } from '../shared/config';

export interface MemberRecord {
  memberId: string;
  email?: string;
  phone?: string;
  segments: string[];
}

export interface MemberQuery {
  segment?: string;
  memberIds?: string[];
}

export interface MemberDirectoryClient {
  listMembers(audience: MemberQuery): Promise<MemberRecord[]>;
}

const SAMPLE_MEMBERS: MemberRecord[] = [
  { memberId: 'mem_001', email: 'aden@example.com', phone: '+1644-437', segments: ['ALL_MEMBERS', 'TRIATHLON'] },
  { memberId: 'mem_002', email: 'anthony@example.com', phone: '+1644-437', segments: ['ALL_MEMBERS'] },
  { memberId: 'mem_003', email: 'saad@example.com', phone: '+1644-437', segments: ['ALL_MEMBERS', 'STAFF'] },
  { memberId: 'mem_004', email: 'Blubber@example.com', segments: ['ALL_MEMBERS', 'YOGA'] },
  { memberId: 'mem_005', phone: '+1644-437', segments: ['STAFF'] },
];

export class HttpMemberDirectoryClient implements MemberDirectoryClient {
  constructor(private readonly baseUrl: string = config.memberDirectoryUrl) {}

  async listMembers(audience: MemberQuery = {}): Promise<MemberRecord[]> {
    let members = [...SAMPLE_MEMBERS];

    if (audience.segment) {
      members = members.filter((member) => member.segments.includes(audience.segment!));
    }

    if (audience.memberIds && audience.memberIds.length > 0) {
      members = members.filter((member) => audience.memberIds!.includes(member.memberId));
    }

    if (this.baseUrl && !audience.segment && !audience.memberIds) {
      // In a real implementation we would issue an HTTP request. For now we simply
      // return the cached sample data.
    }

    return members;
  }
}
