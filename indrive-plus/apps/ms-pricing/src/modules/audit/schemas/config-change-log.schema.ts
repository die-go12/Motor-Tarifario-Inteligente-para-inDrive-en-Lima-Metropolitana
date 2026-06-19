import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConfigChangeLogDocument = HydratedDocument<ConfigChangeLog>;

export enum ConfigAuditAction {
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  UPDATE_WEIGHTS = 'UPDATE_WEIGHTS',
}

@Schema({ collection: 'config_change_logs', timestamps: true })
export class ConfigChangeLog {
  @Prop({ type: String, required: true, enum: ConfigAuditAction })
  action: ConfigAuditAction;

  @Prop({ required: true })
  adminId: number;

  @Prop({ required: true })
  adminEmail: string;

  @Prop({ required: true })
  adminRole: string;

  @Prop({ type: [String], required: true })
  changedKeys: string[];

  @Prop({ type: Object, required: true })
  oldValues: Record<string, unknown>;

  @Prop({ type: Object, required: true })
  newValues: Record<string, unknown>;

  @Prop()
  details?: string;
}

export const ConfigChangeLogSchema =
  SchemaFactory.createForClass(ConfigChangeLog);