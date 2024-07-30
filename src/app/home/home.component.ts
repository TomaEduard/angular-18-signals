import {Component, computed, effect, ElementRef, inject, Injector, OnInit, signal, viewChild} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {from, interval} from "rxjs";
import {openEditCourseDialog} from "../edit-course-dialog/edit-course-dialog.component";
import {AsyncPipe} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    CoursesCardListComponent,
    AsyncPipe,
    MatTooltip,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  counter = 0;
  intervalCounter = signal(0);
  counter$ = interval(1000);
  injector = inject(Injector);

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

  // @ts-ignore
  beginnersList = viewChild<CoursesCardListComponent>('beginnersList');

  // test
  courses$ = toObservable(this.#courses);

  constructor() {
    this.courses$.subscribe(courses => {
      console.log(`🔵 courses`, courses);
    });

    effect(() => {
      // console.log(`🟢 beginnersList`, this.beginnersList);
    });

    effect(() => {
      // console.log(`Beginner courses: `, this.beginnerCourses())
      // console.log(`Advanced courses: `, this.advancedCourses())
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


  onToObservableExample() {
    const number = signal(0);
    number.set(1);
    const numbers$ = toObservable(number, {
      injector: this.injector
    });
    number.set(2);

    numbers$.subscribe(value => {
      console.log(`🟢 number:`, value);
    });

    number.set(3);
    number.set(4);
  }

  toSignalExample() {
    const courses$ = from(this.coursesService.loadAllCourses());

    const courses = toSignal(courses$, {
      injector: this.injector
    });

    effect(() => {
      console.log(`🔵 courses`, courses());
    }, {
      injector: this.injector
    });

  }
}
