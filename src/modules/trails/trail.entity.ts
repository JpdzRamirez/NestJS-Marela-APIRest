import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

@Entity('rutas')
export class Trail {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    name?: string;
    
    @Column({ name: 'unidades_municipales',type: 'json', nullable: false })
    municipal_list?: Record<string, any>;

}