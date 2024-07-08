import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {interval} from "rxjs";
import {openEditCourseDialog} from "../edit-course-dialog/edit-course-dialog.component";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    CoursesCardListComponent,
    AsyncPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  counter = 0;

  intervalCounter = signal(0);

  counter$ = interval(1000);

  ngOnInit() {
    setInterval(() => {
      this.intervalCounter
      .update(counter => counter + 1)
    }, 1000);
  }

  increment() {
    this.counter++;
  }

  #courses = signal<Course[]>([]);

  coursesService = inject(CoursesService);

  dialog = inject(MatDialog);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course =>
      course.category === "BEGINNER")
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course =>
      course.category === "ADVANCED")
  });

  messageService = inject(MessagesService);

  constructor() {
    effect(() => {
      console.log(`Beginner courses: `, this.beginnerCourses())
      console.log(`Advanced courses: `, this.advancedCourses())
    });

    this.loadCourses()
    .then(() => console.log(`All courses loaded:`, this.#courses()));
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();
      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (err) {
      this.messageService.showMessage(
        `Error loading courses!`,
        "error"
      );
      console.error(err);
    }
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();
    const newCourses = courses.map(course => (
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourses = courses.filter(
        course => course.id !== courseId)
      this.#courses.set(newCourses);
    } catch (err) {
      console.error(err)
      alert(`Error deleting course.`)
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(
      this.dialog,
      {
        mode: "create",
        title: "Create New Course"
      }
    )
    if (!newCourse) {
      return;
    }
    const newCourses = [
      ...this.#courses(),
      newCourse
    ];
    this.#courses.set(newCourses);
  }


}
