package com.clinica.api.service;

import com.clinica.api.model.Paciente;
import com.clinica.api.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository repository;

    public Paciente salvar(Paciente paciente) {
        return repository.save(paciente);
    }

    public List<Paciente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Paciente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public List<Paciente> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public Optional<Paciente> atualizar(Long id, Paciente pacienteAtualizado) {
        return repository.findById(id).map(pacienteExistente -> {
            pacienteExistente.setNome(pacienteAtualizado.getNome());
            pacienteExistente.setCpf(pacienteAtualizado.getCpf());
            pacienteExistente.setTelefone(pacienteAtualizado.getTelefone());                                                                    // setCep
            pacienteExistente.setRua(pacienteAtualizado.getRua());
            pacienteExistente.setBairro(pacienteAtualizado.getBairro());
            pacienteExistente.setCidade(pacienteAtualizado.getCidade());
            pacienteExistente.setEstado(pacienteAtualizado.getEstado());
            pacienteExistente.setNumero(pacienteAtualizado.getNumero());
            return repository.save(pacienteExistente);
        });
    }

    public boolean excluir(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}