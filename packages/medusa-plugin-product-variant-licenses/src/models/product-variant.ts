import { AfterInsert, BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { generateEntityId } from "@medusajs/utils";
import { BaseEntity, ProductVariant as MedusaProductVariant } from "@medusajs/medusa";


@Entity()
@Index(["sku", "product_id", ], { unique: true })  
export class ProductVariant extends MedusaProductVariant {
   
 /** validates the licese format */
  validateLicense(expression: RegExp = /^[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/gm): boolean {
    const result =  expression.test(this.sku)
    if(!this.sku)
        throw new Error("invalid license format")
    return true;
  }

  @Column({ nullable: true, type: "text" })
  sku: string | null


  @Column({type:"varchar",nullable:true})
  refresh_url?: string;

  @BeforeInsert()
  private beforeInsertLicense(): void {
    //this.validateLicense()
    this.id = generateEntityId(this.id, "lic_")
    if(this.inventory_quantity  != 1 && this.inventory_quantity != 0)
        this.inventory_quantity = 1;
  }
  @BeforeUpdate()
  private beforeUpdateLicense(): void {
  if(this.inventory_quantity  != 1 && this.inventory_quantity != 0) {
    //this.validateLicense()
    this.inventory_quantity = 0;
  }
}
}
export default  ProductVariant
