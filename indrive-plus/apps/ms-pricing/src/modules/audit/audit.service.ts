import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthenticatedUser } from '@app/shared';
import { PricingLog } from './schemas/pricing-log.schema';
import { AnomalyLog } from './schemas/anomaly-log.schema';
import { PricingHistory } from './schemas/pricing-history.schema';
import {
  ConfigAuditAction,
  ConfigChangeLog,
} from './schemas/config-change-log.schema';

const WEIGHT_KEYS = new Set([
  'historicWeight',
  'trafficWeight',
  'hourWeight',
  'timeWeight',
]);

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(PricingLog.name)
    private readonly pricingLogModel: Model<PricingLog>,
    @InjectModel(AnomalyLog.name)
    private readonly anomalyLogModel: Model<AnomalyLog>,
    @InjectModel(PricingHistory.name)
    private readonly pricingHistoryModel: Model<PricingHistory>,
    @InjectModel(ConfigChangeLog.name)
    private readonly configChangeLogModel: Model<ConfigChangeLog>,
  ) {}

  async getLogs(limit = 100): Promise<{
    pricing: PricingLog[];
    anomalies: AnomalyLog[];
    history: PricingHistory[];
    configChanges: ConfigChangeLog[];
    total: {
      pricingLogs: number;
      anomalyLogs: number;
      historyRecords: number;
      configChanges: number;
    };
  }> {
    const safeLimit = Math.max(1, Math.min(limit, 500));

    const [pricing, anomalies, history, configChanges] = await Promise.all([
      this.pricingLogModel.find().sort({ createdAt: -1 }).limit(safeLimit).lean(),
      this.anomalyLogModel.find().sort({ createdAt: -1 }).limit(safeLimit).lean(),
      this.pricingHistoryModel
        .find()
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean(),
      this.configChangeLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean(),
    ]);

    return {
      pricing,
      anomalies,
      history,
      configChanges,
      total: {
        pricingLogs: pricing.length,
        anomalyLogs: anomalies.length,
        historyRecords: history.length,
        configChanges: configChanges.length,
      },
    };
  }

  async logConfigChange(
    admin: AuthenticatedUser,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    const changedKeys = Object.keys(newValues).filter(
      (key) => oldValues[key] !== newValues[key],
    );

    if (changedKeys.length === 0) {
      return;
    }

    const action = changedKeys.every((key) => WEIGHT_KEYS.has(key))
      ? ConfigAuditAction.UPDATE_WEIGHTS
      : ConfigAuditAction.UPDATE_CONFIG;

    await this.configChangeLogModel.create({
      action,
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      changedKeys,
      oldValues,
      newValues,
      details:
        action === ConfigAuditAction.UPDATE_WEIGHTS
          ? `Pesos actualizados: ${changedKeys.join(', ')}`
          : `Configuracion actualizada: ${changedKeys.join(', ')}`,
    });
  }
}