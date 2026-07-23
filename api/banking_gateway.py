from dataclasses import dataclass


class BankingTimeoutError(RuntimeError):
    pass


@dataclass(frozen=True)
class GatewayResult:
    status: str
    idempotency_key: str
    attempts: int


class MockBankingGateway:
    """Controlled integration mock. It never submits an account-opening request."""

    def __init__(self) -> None:
        self._results: dict[str, GatewayResult] = {}

    def validate_handoff(
        self,
        *,
        case_id: str,
        state: str,
        idempotency_key: str,
        failures_before_success: int = 0,
        max_attempts: int = 3,
    ) -> GatewayResult:
        if idempotency_key in self._results:
            return self._results[idempotency_key]
        if state != "PRONTA_PARA_SUBMISSAO":
            raise ValueError("Handoff bloqueado: gates documentais não aprovados.")
        for attempt in range(1, max_attempts + 1):
            if attempt <= failures_before_success:
                continue
            result = GatewayResult(
                status="VALIDACAO_SOMBRA_REQUERIDA",
                idempotency_key=idempotency_key,
                attempts=attempt,
            )
            self._results[idempotency_key] = result
            return result
        raise BankingTimeoutError(
            f"Gateway indisponível após {max_attempts} tentativa(s) para {case_id}."
        )
