import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatExpansionModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit, OnDestroy {
  private scriptElement: any;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I create a new task?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To create a new task, navigate to the Board and click the blue 'New task' button in the top right corner. A dialog will appear where you can enter the task title, description, select a project, set a priority, and choose its initial status."
          }
        },
        {
          "@type": "Question",
          "name": "How do I move tasks across columns?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TaskFlow features a fully interactive Kanban board. Simply click and hold any task card, drag it to the desired column (To Do, In Progress, Testing, or Completed), and release it. The task's progress and your dashboard KPIs will update automatically."
          }
        },
        {
          "@type": "Question",
          "name": "How do I add a new Project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In the left sidebar, click the '+' icon next to the 'PROJECTS' heading. You will be prompted to enter a new project name. Note: Only administrators can create new projects. Once created, the project will appear in your sidebar."
          }
        },
        {
          "@type": "Question",
          "name": "How do I filter tasks by project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Click on any project name in the left sidebar. Your board and KPI counters will instantly filter to show only tasks belonging to that specific project. To view all tasks again, click 'Dashboard' or 'Board' at the top of the sidebar."
          }
        },
        {
          "@type": "Question",
          "name": "How do I edit or delete a task?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply click the Edit (pencil) or Delete (trash can) icon in the top right corner of any task card on the board. Clicking Edit will open a dialog to modify the task, while Delete will permanently remove it."
          }
        }
      ]
    };

    this.scriptElement = this.renderer.createElement('script');
    this.scriptElement.type = 'application/ld+json';
    this.scriptElement.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, this.scriptElement);
  }

  ngOnDestroy() {
    if (this.scriptElement) {
      this.renderer.removeChild(this.document.head, this.scriptElement);
    }
  }
}
