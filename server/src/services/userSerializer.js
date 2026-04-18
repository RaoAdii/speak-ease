export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    imageSrc: user.imageSrc,
    role: user.role,
    activeCourseId: user.activeCourseId,
    hearts: user.hearts,
    points: user.points
  };
}

export function serializeUserProgress(user, activeCourse = null) {
  return {
    userId: user._id.toString(),
    userName: user.name,
    userImageSrc: user.imageSrc,
    activeCourseId: user.activeCourseId,
    activeCourse,
    hearts: user.hearts,
    points: user.points
  };
}
