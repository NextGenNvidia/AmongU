import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamMember {
  registrationId?: Types.ObjectId;
  candidateId: string;
  name: string;
  collegeId: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  section: string;
  suitColor: string;
  role: 'crewmate' | 'impostor' | 'unassigned';
  isPresent: boolean;
}

export interface IRound1Submission {
  pptUrl?: string;
  projectTitle?: string;
  problemStatement?: string;
  proposedSolution?: string;
  submittedAt?: Date;
  score?: number;
  juryFeedback?: string;
}

export interface IRound2Submission {
  repoUrl?: string;
  liveDemoUrl?: string;
  techStack?: string[];
  implementationStatus?: string;
  technicalComplexity?: string;
  commitsCount?: number;
  submittedAt?: Date;
  score?: number;
  sabotageDetected?: boolean;
  juryFeedback?: string;
}

export interface ITeam extends Document {
  teamId: string;
  name: string;
  track: string;
  tableNumber: number;
  members: ITeamMember[];
  impostorId?: string;
  impostorRevealed: boolean;
  round1Submission?: IRound1Submission;
  round2Submission?: IRound2Submission;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
    },
    candidateId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    suitColor: {
      type: String,
      default: '#EF4444',
    },
    role: {
      type: String,
      enum: ['crewmate', 'impostor', 'unassigned'],
      default: 'unassigned',
    },
    isPresent: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    track: {
      type: String,
      default: 'Web Development',
      trim: true,
    },
    tableNumber: {
      type: Number,
      default: 1,
    },
    members: [teamMemberSchema],
    impostorId: {
      type: String,
      trim: true,
    },
    impostorRevealed: {
      type: Boolean,
      default: false,
    },
    round1Submission: {
      pptUrl: { type: String, trim: true },
      projectTitle: { type: String, trim: true },
      problemStatement: { type: String, trim: true },
      proposedSolution: { type: String, trim: true },
      submittedAt: { type: Date },
      score: { type: Number, min: 0, max: 100 },
      juryFeedback: { type: String, trim: true },
    },
    round2Submission: {
      repoUrl: { type: String, trim: true },
      liveDemoUrl: { type: String, trim: true },
      techStack: [{ type: String, trim: true }],
      implementationStatus: { type: String, trim: true },
      technicalComplexity: { type: String, trim: true },
      commitsCount: { type: Number, default: 0 },
      submittedAt: { type: Date },
      score: { type: Number, min: 0, max: 100 },
      sabotageDetected: { type: Boolean, default: false },
      juryFeedback: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Team = model<ITeam>('Team', teamSchema);
