from datetime import date, datetime

from api.schemas import Document


REQUIRED_DOCUMENTS = {"contrato", "repr", "endereco", "form", "poderes"}


def evaluate_documents(documents: list[Document], today: date) -> tuple[str | None, str | None]:
    by_id = {document.id: document for document in documents}
    missing = REQUIRED_DOCUMENTS - {key for key, document in by_id.items() if document.present}
    if missing:
        return "DOC_INCOMPLETO", f"Documentação obrigatória ausente: {', '.join(sorted(missing))}."

    unreadable = next((document for document in documents if not document.readable), None)
    if unreadable:
        return "DOC_ILEGIVEL", f"{unreadable.label} não pôde ser lido com segurança."

    address = by_id["endereco"]
    if not address.issued_at:
        return "DOC_INCOMPLETO", "Data de emissão do comprovante de endereço não informada."

    issued_at = datetime.strptime(address.issued_at, "%Y-%m-%d").date()
    if (today - issued_at).days >= 90:
        return "DOC_VENCIDO", "Comprovante de endereço emitido há 90 dias ou mais."

    return None, None
