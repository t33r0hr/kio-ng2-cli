import { mock } from 'kio-ng2-component-routing'

export const Fixture = mock.mockType ('<%= contentType %><% for(var i=0; i<modifiers.length; i++) {%>.<%= modifiers[i] %><% } %>',[<% for(var i=0; i<childTypes.length; i++) {%><%= i > 0 ? "," : "" %>'<%= childTypes[i] %>'<% } %>])
