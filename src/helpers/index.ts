const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes since midnight back to time (e.g., "8:00 AM")
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert 0 to 12 for AM/PM format
  return `${formattedHours}:${mins.toString().padStart(2, "0")} ${period}`;
};

// Helper function to generate time slots
const generateContinuousTimeBlocks = (startTime, endTime, blockDuration) => {
  const blocks = [];
  let start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (start + blockDuration <= end) {
    const blockStart = minutesToTime(start);
    const blockEnd = minutesToTime(start + blockDuration);
    blocks.push(`${blockStart} - ${blockEnd}`);
    // Increment start by the block duration to ensure non-overlapping slots
    start += blockDuration;
  }

  return blocks;
};

const dayOfWeek = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

const isTimeBefore = (time1, time2) => {
  return timeToMinutes(time1) < timeToMinutes(time2);
};

const isTimeAfter = (time1, time2) => {
  return timeToMinutes(time1) > timeToMinutes(time2);
};

const validateTimeRange = (startTime: string, endTime: string) => {
  // Parse the times into hours and minutes
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Convert the times into minutes since midnight
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;

  // Check if end time is greater than start time
  if (endInMinutes <= startInMinutes) {
    throw new Error("End time must be greater than start time.");
  }

  // Check if the difference is a whole number of hours
  const timeDifferenceInHours = (endInMinutes - startInMinutes) / 60;

  if (timeDifferenceInHours % 1 !== 0) {
    throw new Error("Time difference must be a whole number of hours.");
  }

  return true; // Passed validation
};

export {
  timeToMinutes,
  minutesToTime,
  generateContinuousTimeBlocks,
  dayOfWeek,
  isTimeBefore,
  isTimeAfter,
  validateTimeRange,
};
