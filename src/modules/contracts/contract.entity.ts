import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { OverdueDebt } from '../overdue_debt/overdue_debt.entity';
import { Activity } from '../activities/activity.entity';
import { Client } from '../clients/client.entity';
import { WaterMeter } from '../meters/meters.entity';
import { TypeService } from '../type_services/type_service.entity';
import { MunicipalUnit } from '../municipal_unit/municipal_unit.entity';


@Entity('contratos') 
export class Contract {
  @PrimaryGeneratedColumn('increment') 
  id!: number;

  @Column({ name: 'id_contrato',type: 'uuid', nullable: false, unique: true })
  id_contrato!: string;

  @Column({ name: 'fecha', type: 'timestamp',nullable: false})
  fecha!: Date; 

  @ManyToOne(() => Client, { nullable: true, eager: false })
  @JoinColumn({ name: 'cliente_id', referencedColumnName: 'id_cliente' })
  cliente?: Client | null;

  @ManyToOne(() => WaterMeter, { nullable: true, eager: false })
  @JoinColumn({ name: 'medidor_id' , referencedColumnName: 'id_medidor'})
  medidor?: WaterMeter | null;

  @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
  uploaded_by_authsupa?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
  sync_with?: Record<string, any>[] | null;

  @ManyToOne(() => TypeService, { nullable: true, eager: false })
  @JoinColumn({ name: 'tiposervicio_id', referencedColumnName: 'id_tiposervicio' })
  tipo_servicio?: TypeService | null;

  @ManyToOne(() => MunicipalUnit, { nullable: true, eager: false })
  @JoinColumn({ name: 'unidad_municipal_id', referencedColumnName: 'id_unidadmunicipal' })
  unidad_municipal?: MunicipalUnit | null;

  @OneToMany(() => Invoice, (invoice) => invoice.contrato)
  facturas?: Invoice[];

  @OneToMany(() => Activity, (activity) => activity.contrato)
  actividades?: Activity[];

  @OneToMany(() => OverdueDebt, (overduedebt) => overduedebt.contrato)
  moras?: OverdueDebt[];
}
