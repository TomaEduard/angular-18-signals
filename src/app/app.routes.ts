import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {isUserAuthenticated} from "./guards/auth.guard";
import {courseResolver} from "./course/resolvers/course.resolver";
import {CourseComponent} from "./course/course.component";
import {courseLessonsResolver} from "./course/resolvers/course-lessons.resolver";
import {LessonsComponent} from "./lessons/lessons.component";

export const routes: Routes = [
  {
    path: "lessons",
    component: LessonsComponent,
  },
  {
    path: "courses/:courseId",
    component: CourseComponent,
    canActivate: [isUserAuthenticated],
    resolve: {
      course: courseResolver,
      lessons: courseLessonsResolver
    }
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [isUserAuthenticated]
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
