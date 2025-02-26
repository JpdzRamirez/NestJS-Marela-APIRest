import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { Activity } from '../activities/activity.entity';
import { Client } from '../clients/client.entity';
import { Meter } from '../meters/meters.entity';
import { TypeService } from '../type_services/type_service.entity';
import { MunicipalUnit } from '../municipal_unit/municipal_unit.entity';


@Entity('contratos') 
export class Contract {
  @PrimaryGeneratedColumn('increment') 
  id!: number;

  @Column({ name: 'fecha', type: 'timestamp',nullable: false})
  date_registered!: Date; 

  @ManyToOne(() => Client, { nullable: true, eager: true })
  @JoinColumn({ name: 'cliente_id' })
  client?: Client | null;

  @ManyToOne(() => Meter, { nullable: true, eager: true })
  @JoinColumn({ name: 'medidor_id' })
  meter?: Meter | null;

  @ManyToOne(() => TypeService, { nullable: true, eager: true })
  @JoinColumn({ name: 'tiposervicio_id' })
  type_service?: TypeService | null;

  @ManyToOne(() => MunicipalUnit, { nullable: true, eager: true })
  @JoinColumn({ name: 'unidad_municipal_id' })
  municipal_unit?: MunicipalUnit | null;

  @OneToMany(() => Invoice, (invoice) => invoice.contract)
  invoices?: Invoice[];

  @OneToMany(() => Activity, (activity) => activity.contract)
  activities?: Activity[];
}
