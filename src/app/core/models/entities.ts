/** اسم الأكاديمية وبيانات التواصل */
export interface Academy {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/** المدرب */
export interface Coach {
  id: number;
  name: string;
  phone: string;
  /** يُرسل بصيغة yyyy-MM-dd */
  dateOfBirth: string;
}

/** ولي الأمر */
export interface Parent {
  id: number;
  name: string;
  phone: string;
  address: string;
}

/** الطالب */
export interface Student {
  id: number;
  name: string;
  address: string;
  phone: string;
  parentId: number;
}

/** الكورس */
export interface Course {
  id: number;
  name: string;
  level: number;
  day: string;
  time: string;
  coachID: number;
}

/** الحصة / المحاضرة */
export interface Session {
  id: number;
  /** مخزّن كرقم في النظام الخلفي (تنسيق yyyyMMddHHmm) */
  dateTime: number;
  courseID: number;
}

/** التسجيل في كورس */
export interface Registration {
  id: number;
  studentId: number;
  courseId: number;
}

/** الحضور */
export interface Attendence {
  id: number;
  studentId: number;
  sessionId: number;
}

/** تقييم / ملاحظة على طالب في كورس */
export interface Feedback {
  id: number;
  content: string;
  courseID: number;
  studentID: number;
}
