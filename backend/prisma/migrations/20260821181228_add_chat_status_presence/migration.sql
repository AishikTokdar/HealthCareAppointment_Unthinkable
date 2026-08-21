-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "chatStatus" "ChatStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "doctorLastSeen" TIMESTAMP(3),
ADD COLUMN     "patientLastSeen" TIMESTAMP(3);
