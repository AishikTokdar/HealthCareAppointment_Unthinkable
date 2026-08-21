const Joi = require('joi');

const registerPatientSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().max(20).allow('', null)
});

const registerDoctorSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().max(20).allow('', null),
  specialisation: Joi.string().trim().min(2).max(100).required(),
  slotDuration: Joi.number().integer().min(10).max(120).default(30),
  workingHours: Joi.object().pattern(
    Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'),
    Joi.object({
      start: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
      end: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
    })
  ).allow(null),
  bio: Joi.string().trim().max(500).allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().max(128)
});

const holdSlotSchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  startsAt: Joi.string().isoDate().required()
});

const confirmBookingSchema = Joi.object({
  holdToken: Joi.string().uuid().required(),
  symptoms: Joi.string().trim().min(1).max(5000).required()
});

const rescheduleSchema = Joi.object({
  startsAt: Joi.string().isoDate().required()
});

const cancelSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null)
});

const submitVisitNotesSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),
  clinicalNotes: Joi.string().trim().min(1).max(10000).required(),
  prescription: Joi.array().items(
    Joi.object({
      drug: Joi.string().trim().min(1).max(200).required(),
      dose: Joi.string().trim().min(1).max(100).required(),
      frequency: Joi.string().trim().max(100).default('once daily')
    })
  ).max(20).allow(null)
});

const submitSymptomFormSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),
  rawSymptoms: Joi.string().trim().min(1).max(5000).required()
});

const createDoctorDirectlySchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().max(20).allow('', null),
  specialisation: Joi.string().trim().min(2).max(100).required(),
  slotDuration: Joi.number().integer().min(10).max(120).default(30),
  workingHours: Joi.object().pattern(
    Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'),
    Joi.object({
      start: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
      end: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
    })
  ).allow(null),
  bio: Joi.string().trim().max(500).allow('', null)
});

const addLeaveSchema = Joi.object({
  date: Joi.string().isoDate().required(),
  reason: Joi.string().trim().max(500).allow('', null)
});

const rejectDoctorSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null)
});

const updateDoctorProfileSchema = Joi.object({
  specialisation: Joi.string().trim().min(2).max(100).allow(null),
  slotDuration: Joi.number().integer().min(10).max(120).allow(null),
  workingHours: Joi.object().pattern(
    Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'),
    Joi.object({
      start: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
      end: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
    })
  ).allow(null),
  bio: Joi.string().trim().max(500).allow('', null),
  isActive: Joi.boolean().allow(null)
});

const slotsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
    .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' })
});

module.exports = {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  holdSlotSchema,
  confirmBookingSchema,
  rescheduleSchema,
  cancelSchema,
  submitVisitNotesSchema,
  submitSymptomFormSchema,
  createDoctorDirectlySchema,
  addLeaveSchema,
  rejectDoctorSchema,
  updateDoctorProfileSchema,
  slotsQuerySchema
};
