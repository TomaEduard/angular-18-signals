import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {isUserAuthenticated} from "./guards/auth.guard";
import {courseResolver} from "./course/resolvers/course.resolver";
import {CourseComponent} from "./course/course.component";
import {courseLessonsResolver} from "./course/resolvers/course-lessons.resolver";


export const routes: Routes = [
  {
    path: "lessons",
    redirectTo: ({params, queryParams}) => {
      return "/login"
    }
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
