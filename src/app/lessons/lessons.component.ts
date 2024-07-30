import {Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {LessonsService} from "../services/lessons.service";
import {Lesson} from "../models/lesson.model";
import {LessonDetailComponent} from "./lesson-detail/lesson-detail.component";

@Component({
  selector: 'lessons',
  standalone: true,
  imports: [
    LessonDetailComponent
  ],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent {

  mode = signal<'master' | 'detail'>("master");
  lessons = signal<Lesson[]>([]);

  selectedLessons = signal<Lesson | null>(null);

  lessonsService = inject(LessonsService);

  searchInput = viewChild.required<ElementRef>('search');

  async onSearch() {
    const query = this.searchInput()?.nativeElement.value;
    console.log(`🟠 query`, query);

    const results = await this.lessonsService.loadLessons({query});

    this.lessons.set(results);
    console.log(`🟠 this.lessons`, this.lessons());
  }

  onEdit(id: string) {

  }

  onLessonSelected(lesson: Lesson) {
    this.mode.set('detail');
    this.selectedLessons.set(lesson);
  }

  onCancel() {
    this.mode.set('master');
  }

  onLessonUpdated(lesson: Lesson) {
    this.lessons.update(lessons =>
      lessons.map(l => l.id === lesson.id ? lesson : l)
    );

  }
}
