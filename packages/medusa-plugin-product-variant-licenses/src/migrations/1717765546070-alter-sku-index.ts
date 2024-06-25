import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSkuIndex1717765546070 implements MigrationInterface {

    identifier = 'AlterSkuIndex1717765546070'

    public async up(queryRunner: QueryRunner): Promise<void> {

        const oldIndices = ["IDX_f4dc2c0888b66d547c175f090e","IDX_2ca8cfbdafb998ecfd6d340389"]
       
        await Promise.all(oldIndices.map(async(index)=> {
       
        await queryRunner.query(`
            DROP INDEX IF EXISTS "${index}";
        `);

        // Create a new unique index with updated fields
        await queryRunner.query(`
            CREATE INDEX "${index}" ON "product_variant" ("sku", "product_id");
        `);
        }))

        //await queryRunner.query(query)
        //IDX_f4dc2c0888b66d547c175f090e
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        const oldIndices = ["IDX_f4dc2c0888b66d547c175f090e","IDX_2ca8cfbdafb998ecfd6d340389"]
        
        await Promise.all(oldIndices.map(async(index)=> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "${index}";
        `);

        // Recreate the original unique index
        await queryRunner.query(`
            CREATE INDEX "${index}" ON "product_variant" ("sku");
        `);
        }))
    }

}
