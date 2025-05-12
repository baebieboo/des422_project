export type ContactMessage = {
    id: string;
    full_name: string;
    email: string;
    subject?: string;
    message: string;
    created_at: string;
  };

  export type UserProfile = {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
  };

//   export type Meeting = {
//     id: string;
//     title: string;
//     note?: string;
//     date: string; // ISO date string
//     creator_id: string;
//     created_at: string;
//   };

//   export type MeetingInvite = {
//     id: string;
//     meeting_id: string;
//     invitee_id: string;
//     status: 'pending' | 'accepted' | 'declined';
//   };
  
//   export type TimeResponse = {
//     id: string;
//     meeting_id: string;
//     invitee_id: string;
//     time_range: string;
//     is_available: boolean;
//   };

//   export type Notification = {
//     id: string;
//     user_id: string;
//     message: string;
//     is_read: boolean;
//     created_at: string;
//   };