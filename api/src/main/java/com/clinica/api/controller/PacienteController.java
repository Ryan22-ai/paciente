package com.clinica.api.controller;

import com.clinica.api.model.Paciente;
import com.clinica.api.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    @Autowired
    private PacienteService service;

    @PostMapping
    public ResponseEntity<Paciente> cadastrar(@RequestBody Paciente paciente) {
        Paciente novoPaciente = service.salvar(paciente);
        return new ResponseEntity<>(novoPaciente, HttpStatus.CREATED);
    }

    // Listar Todos ou Filtrar por Nome (GET)
    @GetMapping
    public ResponseEntity<List<Paciente>> listar(@RequestParam(required = false) String nome) {
        if (nome != null && !nome.trim().isEmpty()) {
            return ResponseEntity.ok(service.buscarPorNome(nome));
        }
        List<Paciente> pacientes = service.listarTodos();
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Editar Paciente (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> atualizar(@PathVariable Long id, @RequestBody Paciente paciente) {
        return service.atualizar(id, paciente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (service.excluir(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}