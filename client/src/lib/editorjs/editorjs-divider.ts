export class Divider {
  static get toolbox() {
    return {
      title: "Divider",
      icon: '<svg viewBox="-1.5 -1.5 18.00 18.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.03"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z" fill="#000000"></path> </g></svg>',
    };
  }

  render() {
    const hr = document.createElement("hr");
    hr.className = "divider";
    return hr;
  }

  save() {
    return {}; // no data needed for a divider
  }
}
