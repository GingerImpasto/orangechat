import { Socket } from "socket.io-client";
import { UserType } from "../types";

export interface CallOfferData {
  caller: UserType;
  offer: RTCSessionDescriptionInit;
}

export interface CallAnswerData {
  calleeId: string;
  answer: RTCSessionDescriptionInit;
}

export interface ICECandidateData {
  senderId: string;
  candidate: RTCIceCandidate;
}

export interface CallRejectionData {
  calleeId: string;
}

export interface CallEndData {
  userId: string;
}

export type CallOfferCallback = (data: CallOfferData) => void;
export type CallAnswerCallback = (data: CallAnswerData) => void;
export type ICECandidateCallback = (data: ICECandidateData) => void;
export type CallRejectionCallback = (data: CallRejectionData) => void;
export type CallEndCallback = (data: CallEndData) => void;

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitCallOffer: (data: {
    calleeId: string;
    offer: RTCSessionDescriptionInit;
  }) => Promise<void>;
  answerVideoCall: (
    callerId: string,
    answer: RTCSessionDescriptionInit
  ) => void;
  sendICECandidate: (candidate: RTCIceCandidate, targetUserId: string) => void;
  rejectVideoCall: (callerId: string) => void;
  endVideoCall: (targetUserId: string) => void;
  subscribeToCallOffer: (callback: CallOfferCallback) => void;
  subscribeToCallAnswer: (callback: CallAnswerCallback) => void;
  subscribeToICECandidate: (callback: ICECandidateCallback) => void;
  subscribeToCallRejection: (callback: CallRejectionCallback) => void;
  subscribeToCallEnd: (callback: CallEndCallback) => void;
  unsubscribeFromCallEvents: () => void;
  checkPresence: (
    userId: string
  ) => Promise<{ userId: string; isOnline: boolean }>;

  subscribeToPresence: (
    callback: (userId: string, isOnline: boolean) => void
  ) => void;
  unsubscribeFromPresence: () => void;
}
