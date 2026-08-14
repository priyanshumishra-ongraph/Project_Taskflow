import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask {
  title: string;
  is_completed: boolean;
}

export interface IComment {
  text: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: Date;
  project_id: mongoose.Types.ObjectId;
  creator_id?: mongoose.Types.ObjectId;
  assignee_ids?: mongoose.Types.ObjectId[];
  subtasks?: ISubtask[];
  comments?: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  is_completed: {
    type: Boolean,
    default: false
  }
});

const CommentSchema = new Schema<IComment>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    due_date: {
      type: Date,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    creator_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignee_ids: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    subtasks: [SubtaskSchema],
    comments: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
