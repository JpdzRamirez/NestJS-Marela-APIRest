import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity'
import { User } from '../users/user.entity'; 

@Entity('moras') // Nombre de la tabla en Supabase
export class OverdueDebt {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'mora_maxima', type:'int2',nullable:true })
    mora_maxima?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({name: 'nombre_mora',type: 'varchar', nullable: false })
    nombre_mora?: number; 

    @Column({name: 'nombre_mora', type: 'float8', nullable: false })
    valor_unitario?: number; 

    @Column({name: 'tipo_mora', type: 'int2',nullable: false, unique: true })
    tipo_mora?: number; 

    @Column({name: 'factura_id', type: 'int2', nullable: true })
    factura_id?: number; 

    @Column({name: 'contrato_id', type:'boolean', nullable: false })
    contrato_id?: number; 

    @ManyToOne(() => Contract, (contract) => contract.facturas, { nullable: true})
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contrato: Contract;

}
