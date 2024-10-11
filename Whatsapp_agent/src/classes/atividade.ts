import { ListaTarefas } from "./lista-tarefas";
import { Projeto } from "./projeto";

export class Atividade {
  id: string;
  nome: string;
  parent: Projeto
  //taskLists: ListaTarefas[];

  constructor(nome: string, projeto: Projeto) {
    this.nome = nome;
    this.parent = projeto
    this.id = (projeto.contarAtividades() + 1).toString()
    //this.taskLists = [];
  }

  /* adicionarTaskList(taskList: ListaTarefas) {
    this.taskLists.push(taskList);
  }

  removerTaskList(taskListId: string) {
    this.taskLists = this.taskLists.filter(taskList => taskList.id !== taskListId);
  } */
}
