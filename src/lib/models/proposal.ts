export class ProjectProposal {
  title: string;
  category: string;

  constructor(data: { title: string; category: string }) {
    this.title = data.title;
    this.category = data.category;
  }
}
