import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await (Project as any).find();
    
    const formattedProjects = projects.map((p: any) => {
      const obj = p.toObject();
      return { ...obj, id: obj._id };
    });
    res.status(200).json({ data: formattedProjects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status } = req.body;
    
    // Validation is handled by express-validator middleware

    const newProject = await Project.create({
      name,
      description,
      status: status || 'Active',
    });

    const obj = newProject.toObject();
    res.status(201).json({ data: { ...obj, id: obj._id } });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const updatedProject = await (Project as any).findByIdAndUpdate(
      id,
      { $set: req.body as any },
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const obj = updatedProject.toObject();
    res.status(200).json({ data: { ...obj, id: obj._id } });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedProject = await (Project as any).findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ data: { message: 'Project deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
