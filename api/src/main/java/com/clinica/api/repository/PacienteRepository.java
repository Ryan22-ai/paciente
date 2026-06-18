package com.clinica.api.repository;
import java.util.List;
import com.clinica.api.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    List<Paciente> findByNomeContainingIgnoreCase(String nome);
}