import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity'
import { User } from '../users/user.entity'; 

@Entity('moras') // Nombre de la tabla en Supabase
export class OverdueDebt {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;
    
    @Column({ name: 'id_mora',type: 'uuid', nullable: false, unique: true })
    id_mora!: string;

    @Column({ name: 'mora_maxima', type:'int2',nullable:true })
    mora_maxima!: number | null;  // Puede ser opcional si Supabase lo genera

    @Column({name: 'nombre_mora',type: 'varchar', nullable: false })
    nombre_mora!: string; 

    @Column({name: 'nombre_mora', type: 'float8', nullable: false })
    valor_unitario!: number; 

    @Column({name: 'tipo_mora', type: 'int2',nullable: false })
    tipo_mora!: number; 

    @Column({name: 'factura_id', type: 'uuid', nullable: false })
    factura_id!: string; 

    @Column({name: 'contrato_id', type:'uuid', nullable: false })
    contrato_id!: string; 

    @ManyToOne(() => Contract,{ nullable: true, eager: false })
    @JoinColumn({ name: 'contrato_id', referencedColumnName: 'id_contrato'}) // Nombre de la columna FK en la BD
    contrato: Contract;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

}
