class Individual {
  constructor(distanceCalculator, mutProb, ...coordinates) {
    this.geneCount = coordinates.length;
    this.mutProb = mutProb;
    this.distanceCalculator = distanceCalculator;
    this.chromosome = coordinates.slice();
    this.calculateDistance();
  }

  calculateDistance() {
    let sumDist = 0;
    for (let i = 0; i < this.chromosome.length - 1; i += 1) {
      sumDist += this.distanceCalculator(this.chromosome[i], this.chromosome[i + 1]);
    }
    sumDist += this.distanceCalculator(this.chromosome[0], this.chromosome.slice(-1)[0]);
    this.distance = sumDist;
    return sumDist;
  }

  mutate() {
    if (Math.random() < this.mutProb) {
      const len = this.chromosome.length;

      let idx1 = Math.floor(Math.random() * len);
      let idx2 = Math.floor(Math.random() * len);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * len);
      }

      if (idx1 > idx2) [idx1, idx2] = [idx2, idx1];

      while (idx1 < idx2) {
        [this.chromosome[idx1], this.chromosome[idx2]] =
          [this.chromosome[idx2], this.chromosome[idx1]];
        idx1 += 1;
        idx2 -= 1;
      }
    }

    this.calculateDistance();
    return this.chromosome;
  }

  mate(crossProb, otherInd) {
    if (Math.random() < crossProb) {
      const childChromosomes = [];
      const coordKey = gene => `${gene[0]}:${gene[1]}`;

      while (childChromosomes.length < 2) {
        const donor  = (childChromosomes.length === 0) ? this    : otherInd;
        const filler = (childChromosomes.length === 0) ? otherInd : this;

        const len = donor.chromosome.length;

        let idx1 = Math.floor(Math.random() * len);
        while (idx1 >= len - 1) {
          idx1 = Math.floor(Math.random() * len);
        }
        let idx2 = idx1 + Math.ceil(Math.random() * (len - idx1));

        const childChromosome = new Array(len);

        for (let i = idx1; i < idx2; i += 1) {
          childChromosome[i] = donor.chromosome[i];
        }

        const existingKeys = new Set();
        childChromosome.forEach(gene => {
          if (gene) existingKeys.add(coordKey(gene));
        });

        const reorderedSecondParent = [];
        for (let i = 0; i < len; i += 1) {
          reorderedSecondParent[i] = filler.chromosome[(idx2 + i) % len];
        }

        let childIdx = idx2;
        reorderedSecondParent.forEach(gene => {
          const key = coordKey(gene);
          if (!existingKeys.has(key)) {
            childChromosome[childIdx % len] = gene;
            existingKeys.add(key);
            childIdx += 1;
          }
        });

        childChromosomes.push(childChromosome);
      }

      const children = [];
      childChromosomes.forEach(chromosome => {
        const child = new Individual(this.distanceCalculator, this.mutProb, ...chromosome);
        child.mutate(this.mutProb);
        children.push(child);
      });
      return children;
    }

    const firstParentClone = new Individual(this.distanceCalculator, this.mutProb, ...this.chromosome);
    const secondParentClone = new Individual(this.distanceCalculator, this.mutProb, ...otherInd.chromosome);
    firstParentClone.mutate(this.mutProb);
    secondParentClone.mutate(this.mutProb);
    return [firstParentClone, secondParentClone];
  }
}

export default Individual;
