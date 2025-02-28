import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

@Entity('rutas')
export class Trail {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    nombre?: string;
    
    @Column({ name: 'unidades_municipales',type: 'json', nullable: false })
    unidades_municipales?: Record<string, any>;

}