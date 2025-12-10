package com.manage.fuel.service;

import com.manage.fuel.dto.ProjectDTO;
import com.manage.fuel.model.Project;
import com.manage.fuel.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProjectDTO createProject(ProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setLocation(dto.getLocation());
        return mapToDTO(projectRepository.save(project));
    }

    private ProjectDTO mapToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setLocation(project.getLocation());
        return dto;
    }
}
