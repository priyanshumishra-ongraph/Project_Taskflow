import { Request, Response, NextFunction } from 'express';
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

export const getProjects = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    
    // Validation is handled by express-validator middleware

    const newProject: Project = {
      id: crypto.randomUUID(),
      ...req.body, // spread all fields
      name,
      status: req.body.status || 'Active',
      created_at: new Date().toISOString()
    };

    projects.push(newProject);
    res.status(201).json({ data: newProject });
  } catch (error) {
    next(error);
  }
};

export const updateProject = (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

export const deleteProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects.splice(projectIndex, 1);
    res.status(200).json({ data: { message: 'Project deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
