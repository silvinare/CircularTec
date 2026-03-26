-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('MUNICIPIO', 'GENERADOR', 'RECOLECTOR');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('KG', 'TON');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('PUBLISHED', 'ASSIGNED', 'COLLECTED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'RELEASED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ISSUED', 'ANCHORED', 'VERIFIED', 'ERROR');

-- CreateEnum
CREATE TYPE "AnchorStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "HashAlgorithm" AS ENUM ('SHA256');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('LOT', 'OPERATION', 'CERTIFICATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "tax_id" TEXT,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "UnitType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "waste_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "public_code" TEXT NOT NULL,
    "generator_org_id" TEXT NOT NULL,
    "waste_type_id" TEXT NOT NULL,
    "estimated_quantity_kg" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "pickup_window_start" TIMESTAMP(3) NOT NULL,
    "pickup_window_end" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "LotStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_assignments" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "collector_org_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "lot_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "collector_org_id" TEXT NOT NULL,
    "collected_quantity_kg" DOUBLE PRECISION NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL,
    "confirmed_by_generator_user_id" TEXT,
    "closed_by_user_id" TEXT,
    "closed_at" TIMESTAMP(3),
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_evidences" (
    "id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" "EvidenceType" NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "public_verification_code" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_anchors" (
    "id" TEXT NOT NULL,
    "certificate_id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "hash_algorithm" "HashAlgorithm" NOT NULL DEFAULT 'SHA256',
    "payload_hash" TEXT NOT NULL,
    "tx_id" TEXT,
    "anchored_at" TIMESTAMP(3),
    "status" "AnchorStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,

    CONSTRAINT "blockchain_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "entity_type" "AuditEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "waste_types_code_key" ON "waste_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lots_public_code_key" ON "lots"("public_code");

-- CreateIndex
CREATE INDEX "lots_status_created_at_idx" ON "lots"("status", "created_at");

-- CreateIndex
CREATE INDEX "lots_generator_org_id_created_at_idx" ON "lots"("generator_org_id", "created_at");

-- CreateIndex
CREATE INDEX "lot_assignments_collector_org_id_assigned_at_idx" ON "lot_assignments"("collector_org_id", "assigned_at");

-- CreateIndex
CREATE UNIQUE INDEX "operations_lot_id_key" ON "operations"("lot_id");

-- CreateIndex
CREATE INDEX "operations_status_created_at_idx" ON "operations"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_operation_id_key" ON "certificates"("operation_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_public_verification_code_key" ON "certificates"("public_verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_anchors_certificate_id_key" ON "blockchain_anchors"("certificate_id");

-- CreateIndex
CREATE INDEX "audit_events_entity_type_entity_id_created_at_idx" ON "audit_events"("entity_type", "entity_id", "created_at");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_generator_org_id_fkey" FOREIGN KEY ("generator_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "waste_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_assignments" ADD CONSTRAINT "lot_assignments_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_assignments" ADD CONSTRAINT "lot_assignments_collector_org_id_fkey" FOREIGN KEY ("collector_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_collector_org_id_fkey" FOREIGN KEY ("collector_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_evidences" ADD CONSTRAINT "operation_evidences_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_anchors" ADD CONSTRAINT "blockchain_anchors_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
