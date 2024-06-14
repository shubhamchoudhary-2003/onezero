import { MigrationInterface, QueryRunner } from "typeorm";

export class LicenseVariant1717765546068 implements MigrationInterface {

    identifier = 'LicenseVariant1717765546068'

    public async up(queryRunner: QueryRunner): Promise<void> {

        const query = `ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "refresh_url" varchar(255) NULL;`
        await queryRunner.query(query)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        const query = `ALTER TABLE "product_variant" DROP COLUMN IF EXISTS "refresh_url" varchar(255) NULL;`
        await queryRunner.query(query)
    }

}
