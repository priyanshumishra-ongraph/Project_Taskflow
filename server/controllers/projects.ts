import { Request, Response } from 'express';
import crypto from 'crypto';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

let projects: Project[] = [];

export const getProjects = (req: Request, res: Response) => {
  res.status(200).json({ data: projects });
};

export const createProject = (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProject: Project = {
    id: crypto.randomUUID(),
    ...req.body, // spread all fields
    name,
    status: req.body.status || 'Active',
    created_at: new Date().toISOString()
  };

  projects.push(newProject);
  res.status(201).json({ data: newProject });
};

export const updateProject = (req: Request, res: Response) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex(p => p.id === id);
  const existingProject = projects[projectIndex];
  
  if (projectIndex === -1 || !existingProject) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updatedProject: Project = {
    ...existingProject,
    ...req.body,
    id: existingProject.id
  };

  projects[projectIndex] = updatedProject;
  res.status(200).json({ data: updatedProject });
};

export const deleteProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  projects.splice(projectIndex, 1);
  res.status(200).json({ data: { message: 'Project deleted successfully' } });
};
