export interface DomainModelMapper<Domain, Model> {
  toDomain(modelEntity: Model): Domain;

  toModel(domainEntity: Domain): Partial<Model>;
}
